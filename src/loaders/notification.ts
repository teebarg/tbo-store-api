import { MedusaContainer, NotificationService } from "@medusajs/medusa";

export default async (container: MedusaContainer): Promise<void> => {
    const notificationService = container.resolve<NotificationService>("notificationService");

    notificationService.subscribe("order.placed", "gmail");
    notificationService.subscribe("user.password_reset", "gmail");
};
