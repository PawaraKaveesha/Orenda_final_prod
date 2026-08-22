import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    contentType: { type: String, default: 'image/webp' },
    alt: { type: String, default: '' },
    title: { type: String, default: '' },
    width: { type: Number },
    height: { type: Number },
    originalSize: { type: Number, required: true },
    size: { type: Number, required: true }, // Optimized stored size in bytes
    savedPercent: { type: Number, default: 0 },
    gridFsFileId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    hash: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id
        delete ret._id
        return ret
      },
    },
  }
)

const ImageMeta = mongoose.models.ImageMeta || mongoose.model('ImageMeta', imageSchema)

export default ImageMeta
