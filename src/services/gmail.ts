import { AbstractNotificationService } from "@medusajs/medusa";
import { EntityManager } from "typeorm";
import nodemailer from "nodemailer";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

class EmailSenderService extends AbstractNotificationService {
    static identifier = "gmail";
    protected manager_: EntityManager;
    protected transactionManager_: EntityManager;

    private transporter: nodemailer.Transporter;
    private templateDir_: nodemailer.Transporter;

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
    }

    async sendNotification(
        event: string,
        data: Record<string, any>,
        attachmentGenerator: unknown
    ): Promise<{
        to: string;
        status: string;
        data: Record<string, unknown>;
    }> {
        console.log(event);
        console.log(data);
        console.log(attachmentGenerator);
        if (event === "user.password_reset") {
            console.log("Handling reset");
        }
        const templatePath = path.join(this.templateDir_, `reset-email.hbs`);

        console.log("🚀 ~ EmailSenderService ~ templatePath:", templatePath);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template for event ${event} not found`);
        }

        const templateContent = fs.readFileSync(templatePath, "utf-8");
        const template = Handlebars.compile(templateContent);
        const htmlContent = template(data);
        // const message = "Yo";
        // const template = "<h1>Hello Ade</h1><p>hhhh{{message}}23322</p>"; // Replace with your Handlebars template
        // const compiledTemplate = Handlebars.compile(template);
        // const htmlContent = compiledTemplate(data.templateData);

        const info = await this.transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: data.email,
            subject: `Notification: ${event}`,
            html: htmlContent,
        });

        console.log(info);

        return {
            to: data?.email,
            status: info.accepted.length > 0 ? "sent" : "failed",
            data: {
                otp: "0000",
                id: `msg_sendgrid_${new Date()}`,
                messageId: info.messageId,
                validity: "2024-10-05",
                resource_id: `msg_sendgrid_${new Date()}`,
            },
        };
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
}

export default EmailSenderService;
