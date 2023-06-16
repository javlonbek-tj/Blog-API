import { model, Schema } from 'mongoose';

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: 'true',
    },
    numViews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Feedback',
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

postSchema.pre(/^find/, function (next) {
  // views count
  postSchema.virtual('viewCount').get(function () {
    return this.numViews.length;
  });

  // likes count
  postSchema.virtual('likesCount').get(function () {
    return this.likes.length;
  });

  // dislikes count
  postSchema.virtual('dislikesCount').get(function () {
    return this.dislikes.length;
  });

  // the most liked post in percentage
  postSchema.virtual('likesPercentage').get(function () {
    const total = +this.likes.length + Number(this.likes.length);
    const percentage = (this.likes.length / total) * 100;
    return `${percentage}%`;
  });

  // the most disliked post in percentage
  postSchema.virtual('dislikesPercentage').get(function () {
    const total = +this.dislikes.length + Number(this.dislikes.length);
    const percentage = (this.dislikes.length / total) * 100;
    return `${percentage}%`;
  });

  // days ago post creation date
  postSchema.virtual('daysAgo').get(function () {
    const date = new Date(this.createdAt);
    const daysAgo = Math.floor((Date.now() - date) / 864000000);
    return daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;
  });

  next();
});

const Post = model('Post', postSchema);

export default Post;
