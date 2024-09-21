const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const mailgun = require('nodemailer-mailgun-transport');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const auth = {
    auth: {
        api_key: process.env.API_KEY,
        domain: process.env.DOMAIN
    }
};
const transporter = nodemailer.createTransport(mailgun(auth));

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const data = JSON.parse(body);

            try {
                const uploadedPhotos = await Promise.all(
                    data.photos.map(photo => {
                        return cloudinary.uploader.upload(photo.path, {
                            folder: 'achievements', 
                            use_filename: true
                        });
                    })
                );

                const attachmentURLs = uploadedPhotos.map(upload => ({
                    url: upload.secure_url,
                    name: upload.original_filename
                }));

                const mailOptions = {
                    from: 'mailgun@sandboxa2b0867851a84ee7862313e50e288bd0.mailgun.org',
                    to: 'ebincreations@gmail.com',
                    subject: 'Achievements Submission',
                    text: `Name: ${data.name}\nRoll Number: ${data.rollno}\nAchievement: ${data.achievement}\nDate: ${data.date}\nDescription: ${data.description}`,
                    attachments: attachmentURLs.map(file => ({
                        filename: file.name,
                        path: file.url
                    })),
                };

                const info = await transporter.sendMail(mailOptions);
                res.status(200).send('Message sent: ' + info.messageId);
            } catch (error) {
                res.status(500).send('Error occurred: ' + error.message);
            }
        });
    } else {
        res.status(404).send('Not found');
    }
};
