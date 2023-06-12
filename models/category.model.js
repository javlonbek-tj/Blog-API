import { model, Schema } from 'mongoose';

const categorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Category = model('Category', categorySchema);

export default Category;
