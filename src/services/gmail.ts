import { AbstractNotificationService, UserService, OrderService, CartService, CustomerService } from "@medusajs/medusa";
import { EntityManager } from "typeorm";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

const dir = process.env.TEMPLATE_PATH || "./email_templates";

// Register partials
const headerTemplate = fs.readFileSync(path.join(dir, "partials", "header.hbs"), "utf8");
const footerTemplate = fs.readFileSync(path.join(dir, "partials", "footer.hbs"), "utf8");

Handlebars.registerPartial("header", headerTemplate);
Handlebars.registerPartial("footer", footerTemplate);

// Register layout
const layoutTemplate = fs.readFileSync(path.join(dir, "layouts", "main.hbs"), "utf8");
Handlebars.registerPartial("main", layoutTemplate);

Handlebars.registerHelper("formatMoney", function (value) {
    // Divide by 100 and format with commas
    return (value / 100).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
});

class EmailSenderService extends AbstractNotificationService {
    static readonly identifier = "gmail";
    protected manager_: EntityManager;
    protected transactionManager_: EntityManager;

    private transporter: nodemailer.Transporter;
    private templateDir_: string;

    protected userService: UserService;
    protected orderService: OrderService;
    protected cartService: CartService;
    protected customerService: CustomerService;

    constructor(container: any, options: any) {
        super(container, options);

        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER, // Your Gmail address
                pass: process.env.GMAIL_PASSWORD, // Your Gmail password
            },
        });
        this.templateDir_ = process.env.TEMPLATE_PATH || "./email_templates";
        this.userService = container.userService;
        this.orderService = container.orderService;
        this.cartService = container.cartService;
        this.customerService = container.customerService;
    }

    async sendNotification(
        event: string,
        data: Record<string, any>,
        attachmentGenerator: unknown
    ): Promise<{
        to: string;
        status: string;
        data: Record<string, any>;
    }> {
        console.log(event);
        console.log(data);
        if (event === "user.password_reset") {
            const user = await this.userService.retrieveByEmail(data.email);
            const emailData = {
                userName: user.first_name,
                companyName: process.env.COMPANY,
                expirationTime: 48,
                resetLink: "http://localhost:8000",
                currentYear: new Date().getFullYear(),
            };

            const htmlContent = await this.getHtmlContent(`reset-email.hbs`, emailData);

            return await this.sendEmail(data.email, "Password reset request email", htmlContent, emailData);
        }

        if (event === "order.placed") {
            const order = await this.orderService.retrieve(data.id);
            const user = await this.customerService.retrieve(order.customer_id);
            const cart = await this.cartService.retrieveWithTotals(order.cart_id);
            const emailData = {
                customerName: user?.first_name,
                orderNumber: order.id,
                subtotal: cart.subtotal,
                orderTotal: cart.total,
                discount: cart.discount_total,
                taxes: cart.tax_total,
                deliveryFee: cart.shipping_total,
                orderDate: new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
                items: cart?.items || [],
                shippingAddress: cart.shipping_address || {},
                orderTrackingLink: "",
                companyName: process.env.COMPANY,
                currentYear: new Date().getFullYear(),
            };

            const htmlContent = await this.getHtmlContent(`order-placed.hbs`, emailData);

            return await this.sendEmail(order.email, "New Order Notification", htmlContent, emailData);
        }

        if (event === "customer.created") {
            const emailData = {
                to: data.email,
                storeName: process.env.COMPANY,
                customerName: `${data.first_name} ${data.last_name}`,
                storeUrl: process.env.STORE_FRONT,
                customerEmail: data.email,
                facebookUrl: "https://www.facebook.com/fashionhub",
                instagramUrl: "https://www.instagram.com/fashionhub",
                twitterUrl: "https://www.twitter.com/fashionhub",
                currentYear: new Date().getFullYear(),
            };

            const htmlContent = await this.getHtmlContent(`customer-created.hbs`, emailData);

            return await this.sendEmail(data.email, `Welcome to ${process.env.COMPANY} store`, htmlContent, emailData);
        }
    }

    async resendNotification(
        notification: any,
        config: any,
        attachmentGenerator: any
    ): Promise<{
        to: string;
        status: string;
        data: Record<string, unknown>;
    }> {
        // Resend logic could be implemented similarly
        return this.sendNotification(notification.event, notification.data, attachmentGenerator);
    }

    async getHtmlContent(hbs_template: string, data: Record<string, unknown>): Promise<string> {
        const templatePath = path.join(this.templateDir_, hbs_template);

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template ${hbs_template} not found`);
        }

        const templateContent = fs.readFileSync(templatePath, "utf-8");
        const template = Handlebars.compile(templateContent);
        return template(data);
    }

    async sendEmail(
        to: string,
        subject: string,
        htmlContent: string,
        emailData: any
    ): Promise<{
        to: string;
        status: string;
        data: Record<string, any>;
    }> {
        const info = await this.transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject,
            html: htmlContent,
        });

        return {
            to,
            status: info.accepted.length > 0 ? "done" : "failed",
            data: emailData,
        };
    }
}

export default EmailSenderService;
