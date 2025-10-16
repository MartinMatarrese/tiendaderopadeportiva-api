import nodemailer from "nodemailer";
import "dotenv/config";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

export const sendMail = async(to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Tienda de ropa deportiva" <${process.env.EMAIL}>`,
            to,
            subject,
            html
        });

        return info;
        
    } catch (error) {    
        throw new Error(`No se pudo enviar el email: ${error.message}`);
    };
};

export const sendVerificationEmail = async(user) => {
    try {
        const verificationToken = jwt.sign(
            {userId: user._id},
            process.env.SECRET_KEY,
            { expiresIn: "24h"}
        );

        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const urlVerification = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: `Verifica tu email - Tienda de Ropa Deportiva`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #e53935, #ff6b6b); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0;">¡Bienvenido a TDR!</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9;">Tienda De Ropa Deportiva</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #333;">Hola ${user.first_name},</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Gracias por registrarte en nuestra tienda. Para activar tu cuenta, 
                            por favor verifica tu dirección de email haciendo clic en el siguiente botón:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background: #e53935; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 6px; 
                                      display: inline-block; font-weight: bold;">
                                Verificar Mi Email
                            </a>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                            <a href="${verificationUrl}" style="color: #e53935; word-break: break-all;">
                                ${verificationUrl}
                            </a>
                        </p>
                        
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">
                            Este enlace expirará en 24 horas.<br>
                            Si no te registraste en TDR, por favor ignora este email.
                        </p>
                    </div>
                    
                    <div style="background: #1a1a1a; padding: 20px; text-align: center; color: #ccc;">
                        <p style="margin: 0; font-size: 12px;">
                            © ${new Date().getFullYear()} Tienda De Ropa Deportiva. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email de verificación enviado a: ${user.email}`);
        
    } catch (error) {
        console.error("Error enviando email de verificación:", error);
        throw new Error("Error al enviar el email de verificación");
    };
};