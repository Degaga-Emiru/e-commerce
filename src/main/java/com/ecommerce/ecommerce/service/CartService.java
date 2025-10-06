package com.ecommerce.ecommerce.service;
import com.ecommerce.ecommerce.entity.Cart;
import com.ecommerce.ecommerce.entity.CartItem;
import com.ecommerce.ecommerce.entity.Product;
import com.ecommerce.ecommerce.entity.User;
import com.ecommerce.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.ecommerce.repository.CartRepository;
import com.ecommerce.ecommerce.repository.CartItemRepository;
import com.ecommerce.ecommerce.repository.UserRepository;
import com.ecommerce.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       UserRepository userRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setTotalPrice(BigDecimal.ZERO);
                    newCart.setItemCount(0);
                    return cartRepository.save(newCart);
                });
    }

    public CartItem addItemToCart(Long userId, Long productId, Integer quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + product.getName());
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setUnitPrice(product.getPrice());
        }

        // 🔹 always recalc total price per item
        cartItem.setTotalPrice(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        cartItemRepository.save(cartItem);

        // 🔹 update cart totals
        updateCartTotals(cart);

        return cartItem;
    }

    public void updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        if (quantity <= 0) {
            removeItemFromCart(userId, productId);
            return;
        }

        if (item.getProduct().getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for product: " + item.getProduct().getName());
        }

        item.setQuantity(quantity);
        item.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(quantity)));
        cartItemRepository.save(item);

        updateCartTotals(cart);
    }

    public void removeItemFromCart(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        updateCartTotals(cart);
    }

    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.setTotalPrice(BigDecimal.ZERO);
        cart.setItemCount(0);
        cartRepository.save(cart);
    }

    public List<CartItem> getCartItems(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return cartItemRepository.findByCartId(cart.getId());
    }

    public BigDecimal getCartTotal(Long userId) {
        Cart cart = getOrCreateCart(userId);
        updateCartTotals(cart); // always recalc before returning
        return cart.getTotalPrice();
    }

    public Integer getCartItemCount(Long userId) {
        Cart cart = getOrCreateCart(userId);
        updateCartTotals(cart);
        return cart.getItemCount();
    }

    private void updateCartTotals(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());

        BigDecimal total = items.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int itemCount = items.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        cart.setTotalPrice(total);
        cart.setItemCount(itemCount);
        cartRepository.save(cart);
    }

    public boolean validateCartStock(Long userId) {
        List<CartItem> items = getCartItems(userId);

        for (CartItem item : items) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            if (product.getStockQuantity() < item.getQuantity()) {
                return false;
            }
        }
        return true;
    }

    public void mergeCarts(Long sourceUserId, Long targetUserId) {
        Cart sourceCart = getOrCreateCart(sourceUserId);
        Cart targetCart = getOrCreateCart(targetUserId);

        List<CartItem> sourceItems = cartItemRepository.findByCartId(sourceCart.getId());

        for (CartItem sourceItem : sourceItems) {
            addItemToCart(targetUserId, sourceItem.getProduct().getId(), sourceItem.getQuantity());
        }

        clearCart(sourceUserId);
    }
    public boolean hasSufficientQuantityInCart(Long userId, Long productId, int requestedQuantity) {
        Cart cart = getOrCreateCart(userId);

        Optional<CartItem> cartItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

        if (cartItemOpt.isEmpty()) {
            return false; // product not found in the cart
        }

        CartItem cartItem = cartItemOpt.get();
        return cartItem.getQuantity() >= requestedQuantity; // ✅ check if quantity is enough
    }


}
