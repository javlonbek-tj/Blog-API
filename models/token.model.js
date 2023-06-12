import { model, Schema } from 'mongoose';

const tokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    refreshToken: {
      type: String,
      required: true,
    },
  },
});

const Token = model('token', tokenSchema);

export default Token;
