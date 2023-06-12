import { model, Schema } from 'mongoose';

const feedbackSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Feedback = model('Feedback', feedbackSchema);

export default Feedback;
