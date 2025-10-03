package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.entity.DiscountCoupon;
import com.ecommerce.ecommerce.entity.DiscountType;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.DiscountCouponRepository;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DiscountService {
    private final DiscountCouponRepository couponRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Value("${app.new-user-discount.percentage:10}")
    private int newUserDiscountPercentage;

    @Value("${app.new-user-discount.max-amount:50}")
    private BigDecimal newUserDiscountMaxAmount;

    public DiscountService(DiscountCouponRepository couponRepository, UserRepository userRepository,
                           OrderRepository orderRepository) {
        this.couponRepository = couponRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public DiscountCoupon createCoupon(String code, String name, DiscountType discountType, BigDecimal discountValue,
                                       LocalDateTime expiryDate, Integer usageLimit, boolean forNewUsers) {
        if (couponRepository.findByCode(code).isPresent()) {
            throw new RuntimeException("Coupon code already exists");
        }

        DiscountCoupon coupon = new DiscountCoupon();
        coupon.setCode(code.toUpperCase());
        coupon.setName(name); // <-- set name here
        coupon.setDiscountType(discountType);
        coupon.setDiscountValue(discountValue);
        coupon.setExpiryDate(expiryDate);
        coupon.setUsageLimit(usageLimit);
        coupon.setUsedCount(0);
        coupon.setForNewUsers(forNewUsers);
        coupon.setActive(true);
        coupon.setCreatedAt(LocalDateTime.now());

        return couponRepository.save(coupon);
    }


    public DiscountCoupon createNewUserWelcomeCoupon() {
        String code = "WELCOME" + newUserDiscountPercentage;
        BigDecimal discountValue = new BigDecimal(newUserDiscountPercentage);
        String name = "Welcome " + newUserDiscountPercentage + "% Off"; // name for the coupon

        return createCoupon(
                code,
                name,
                DiscountType.PERCENTAGE,
                discountValue,
                LocalDateTime.now().plusMonths(1), // Valid for 1 month
                1, // One-time use
                true // For new users only
        );
    }

    public DiscountCoupon validateCoupon(String code, Long userId) {
        DiscountCoupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

        if (!coupon.isActive()) {
            throw new RuntimeException("Coupon is no longer active");
        }

        if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Coupon has expired");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new RuntimeException("Coupon usage limit reached");
        }

        if (coupon.isForNewUsers() && userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (!isNewUser(user)) {
                throw new RuntimeException("This coupon is for new users only");
            }
        }

        return coupon;
    }

    public void applyCouponUsage(String code) {
        DiscountCoupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    public List<DiscountCoupon> getAllActiveCoupons() {
        return couponRepository.findActiveCoupons(LocalDateTime.now());
    }

    public List<DiscountCoupon> getNewUserCoupons() {
        return couponRepository.findActiveNewUserCoupons(LocalDateTime.now());
    }

    public DiscountCoupon getCouponById(Long couponId) {
        return couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + couponId));
    }

    public DiscountCoupon updateCoupon(Long couponId, DiscountCoupon couponDetails) {
        DiscountCoupon coupon = getCouponById(couponId);

        coupon.setDiscountType(couponDetails.getDiscountType());
        coupon.setDiscountValue(couponDetails.getDiscountValue());
        coupon.setExpiryDate(couponDetails.getExpiryDate());
        coupon.setUsageLimit(couponDetails.getUsageLimit());
        coupon.setForNewUsers(couponDetails.isForNewUsers());
        coupon.setActive(couponDetails.isActive());

        return couponRepository.save(coupon);
    }

    public void deactivateCoupon(Long couponId) {
        DiscountCoupon coupon = getCouponById(couponId);
        coupon.setActive(false);
        couponRepository.save(coupon);
    }

    public BigDecimal calculateDiscountAmount(BigDecimal orderAmount, DiscountCoupon coupon) {
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal discount = orderAmount.multiply(coupon.getDiscountValue().divide(new BigDecimal(100)));

            // Apply maximum discount limit for new user coupons
            if (coupon.isForNewUsers() && discount.compareTo(newUserDiscountMaxAmount) > 0) {
                return newUserDiscountMaxAmount;
            }

            return discount;
        } else {
            // Fixed amount discount
            return coupon.getDiscountValue().min(orderAmount);
        }
    }

    private boolean isNewUser(User user) {
        Long deliveredOrderCount = orderRepository.countByUserIdAndStatus(user.getId(),
                com.ecommerce.ecommerce.entity.OrderStatus.DELIVERED);
        return deliveredOrderCount == 0;
    }

    public String generateUniqueCouponCode() {
        String code;
        do {
            code = "DISC" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (couponRepository.findByCode(code).isPresent());

        return code;
    }
}
