import { v2 as cloudinary } from "cloudinary";

let configured = false;

const ensureCloudinaryConfig = () => {
  if (configured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
};

type UploadOptions = {
  folder?: string;
  publicId?: string;
};

export const uploadImageToCloudinary = async (
  dataUri: string,
  options: UploadOptions = {},
) => {
  ensureCloudinaryConfig();

  return cloudinary.uploader.upload(dataUri, {
    folder: options.folder ?? "food-ordering/products",
    public_id: options.publicId,
    resource_type: "image",
    overwrite: true,
  });
};
