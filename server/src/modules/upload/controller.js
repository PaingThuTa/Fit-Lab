const asyncHandler = require('../../utils/asyncHandler');
const cloudinary = require('../../config/cloudinary');
const AppError = require('../../utils/appError');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'No image file provided');
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'fitlab/thumbnails',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 450, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, uploadResult) => {
        if (error) return reject(error);
        resolve(uploadResult);
      }
    );

    stream.end(req.file.buffer);
  });

  res.json({
    url: result.secure_url,
    publicId: result.public_id,
  });
});

module.exports = { uploadImage };
