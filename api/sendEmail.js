const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const mailgun = require('nodemailer-mailgun-transport');
const multer = require('multer');
const upload = multer();

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
        // Use Multer to parse multipart/form-data
        upload.array('photos')(req, res, async (err) => {
            if (err) {
                return res.status(500).send('Error uploading files');
            }

            try {
                const { name, rollno, achievement, date, description } = req.body;
                const files = req.files;
                const uploadedPhotos = await Promise.all(
                    files.map(file => {
                        return cloudinary.uploader.upload(file.path, {
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
                    text: `Name: ${name}\nRoll Number: ${rollno}\nAchievement: ${achievement}\nDate: ${date}\nDescription: ${description}`,
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
