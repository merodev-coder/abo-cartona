# Abu Cartona - Email Notification Component

A sleek, Apple-style email notification component with glassmorphism design for the Abu Cartona project.

## Features

✨ **Apple-style Design**: Clean, modern interface with glassmorphism effects  
🎭 **3 Variants**: Friendly, Formal, and Tactical styles for different use cases  
🎬 **Smooth Animations**: Built with Framer Motion for fluid transitions  
📱 **Fully Responsive**: Works perfectly on all devices  
⏱️ **Auto-close**: Optional automatic dismissal with customizable duration  
🔗 **Quick Actions**: Direct email client integration  
🎨 **Visual Effects**: Animated gradients and backdrop blur  

## Components

### 1. EmailNotification Component
The main notification component with glassmorphism design.

**Location**: `src/components/ui/EmailNotification.tsx`

**Props**:
```typescript
interface EmailNotificationProps {
  isVisible: boolean;           // Controls visibility
  onClose: () => void;          // Close handler
  variant?: 'friendly' | 'formal' | 'tactical'; // Style variant
  autoClose?: boolean;          // Auto-dismiss
  duration?: number;            // Auto-close duration (ms)
}
```

### 2. useEmailNotification Hook
Convenient hook for managing email notification state.

**Location**: `src/hooks/useEmailNotification.ts`

**Returns**:
```typescript
{
  isVisible: boolean;
  variant: 'friendly' | 'formal' | 'tactical';
  showEmailNotification: (variant?: 'friendly' | 'formal' | 'tactical') => void;
  hideEmailNotification: () => void;
}
```

## Usage Examples

### Basic Usage
```typescript
import { useEmailNotification } from '@/hooks/useEmailNotification';
import EmailNotification from '@/components/ui/EmailNotification';

function YourComponent() {
  const { showEmailNotification, hideEmailNotification, isVisible, variant } = useEmailNotification();

  const handleOrderComplete = () => {
    // Show friendly notification
    showEmailNotification('friendly');
  };

  return (
    <>
      <button onClick={handleOrderComplete}>
        Complete Order
      </button>
      
      <EmailNotification 
        isVisible={isVisible} 
        onClose={hideEmailNotification}
        variant={variant}
        autoClose={true}
        duration={8000}
      />
    </>
  );
}
```

### Order Completion Integration
```typescript
import OrderCompletion from '@/components/OrderCompletion';

function CheckoutPage() {
  return (
    <OrderCompletion
      orderId="ORD-12345"
      customerEmail="customer@example.com"
      customerName="أحمد محمد"
      totalAmount={1500}
    />
  );
}
```

## Text Variants

### Friendly Variant (Default)
- **Title**: نورنا إيميلك! 📧
- **Message**: بعتنا لك كل تفاصيل أوردرك والملفات اللي طلبتها. بص بصة سريعة على الإيميل ولو فيه أي حاجة إحنا معاك على الواتساب.
- **Submessage**: لو لقيت الإيميل في Spam، حطه في Inbox عشان ميضيعش.

### Formal Variant
- **Title**: تم إرسال التفاصيل
- **Message**: تم إرسال تفاصيل الأوردر إلى بريدك الإلكتروني بنجاح. يرجى مراجعة بريدك الآن.
- **Submessage**: ولا تنسَ تفقد قسم الـ Junk/Spam.

### Tactical Variant
- **Title**: جاري الإرسال...
- **Message**: جاري إرسال الفاتورة لإيميلك.. تأكد من وصول الرسالة خلال دقائق لتأكيد كافة البيانات.
- **Submessage**: تحقق من بريدك الوارد خلال دقائق.

## Design System

### Colors
- **Primary Gradient**: Blue to Purple
- **Glass Effect**: White/80 backdrop blur
- **Text**: Gray scale hierarchy
- **Icons**: Heroicons (outline)

### Typography
- **Title**: 2xl font-bold
- **Message**: Base font-medium
- **Submessage**: Small text in gray

### Animations
- **Entry**: Scale + fade from bottom
- **Exit**: Scale + fade to bottom
- **Hover**: Subtle scale on buttons
- **Background**: Animated gradient overlay

## Integration Points

### 1. Order Completion
Use after successful order placement to send receipts and invoices.

### 2. Password Reset
Notify users when password reset emails are sent.

### 3. Account Verification
Alert users about verification emails.

### 4. Data Export
Inform users when data files are sent via email.

## Customization

### Adding New Variants
1. Update the `emailTexts` object in `EmailNotification.tsx`
2. Add the new variant to the TypeScript types
3. Update the hook if needed

### Styling Customization
The component uses Tailwind CSS classes. Modify the classes in the component to match your brand:

```typescript
// Example: Change the gradient colors
<div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center shadow-lg">
```

## Dependencies

- **React**: ^19.0.3
- **Framer Motion**: ^12.38.0
- **Heroicons**: ^2.2.0
- **Tailwind CSS**: ^3.4.6

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

The component is optimized for performance with:
- Lazy loading of animations
- Efficient state management
- Minimal re-renders
- Optimized backdrop blur

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus management

## Demo

Run the demo component to see all variants in action:

```typescript
import EmailNotificationDemo from '@/components/EmailNotificationDemo';

function App() {
  return <EmailNotificationDemo />;
}
```

---

**Created for Abu Cartona Gaming Store**  
*Designed with ❤️ for the best user experience*
