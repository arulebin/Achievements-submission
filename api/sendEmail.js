const nodemailer = require('nodemailer');
const mailgun = require('nodemailer-mailgun-transport');
const multer = require('multer');
const path = require('path');

// Configure multer to store files in the root 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './'); 
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

const auth = {
    auth: {
        api_key: process.env.API_KEY,
        domain: process.env.DOMAIN
    }
};

const transporter = nodemailer.createTransport(mailgun(auth));

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        upload.array('photos')(req, res, async (err) => {
            if (err) {
                console.error('Upload error:', err); 
                return res.status(500).send('Error uploading files.');
            }

            const { name, rollno, achievement, date, description } = req.body;
            const photos = req.files;

            const mailOptions = {
                from: 'postmaster@sandboxa2b0867851a84ee7862313e50e288bd0.mailgun.org',
                to: 'ebincreations@gmail.com',
                subject: 'Achievements Submission',
                text: `Name: ${name}\nRoll Number: ${rollno}\nAchievement: ${achievement}\nDate: ${date}\nDescription: ${description}`,
                attachments: photos.map(photo => ({
                    filename: photo.originalname,
                    path: path.join(__dirname, photo.originalname)
                })),
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                res.status(200).send('Message sent: ' + info.messageId);
            } catch (error) {
                console.error('Mail sending error:', error); 
                res.status(500).send('Error occurred: ' + error.message);
            }
        });
    } else {
        res.status(404).send('Not found');
    }
};
