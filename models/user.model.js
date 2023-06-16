import { model, Schema } from 'mongoose';
import PostModal from './post.model.js';
import crypto from 'crypto';

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    profilPhoto: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['Admin', 'User', 'Editor'],
      default: 'Admin',
    },
    viewers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    blocked: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    userAward: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold'],
      default: 'Bronze',
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    activationLink: {
      type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.pre('/^find/', async function (next) {
  this.populate({
    path: 'posts',
  });

  /* Last post date that is created by user */

  const userId = this._conditions._id;
  const posts = await PostModal.find({ user: userId }).sort({ createdAt: 1 });
  const lastPost = posts[posts.length - 1];
  const lastPostDate = new Date(lastPost?.createdAt);
  userSchema.virtual('lastPostDate').get(function () {
    return lastPostDate;
  });

  /* User inActive if lastPostDate > 30 days */

  const currentDate = new Date();
  const diff = currentDate - lastPostDate;

  const diffInDays = diff / (1000 * 3600 * 24);
  if (diffInDays > 30) {
    userSchema.virtual('isInactive').get(function () {
      return true;
    });
    await User.findByIdAndUpdate(userId, {
      isBlocked: true,
    });
  } else {
    userSchema.virtual('isInactive').get(function () {
      return false;
    });
    await User.findByIdAndUpdate(userId, {
      isBlocked: false,
    });
  }

  //------Last Active Date-------

  //convert to days ago
  const daysAgo = Math.floor(diffInDays);
  //add virtuals lastActive in days to the schema
  userSchema.virtual('lastActive').get(function () {
    //check if daysAgo is less than 0
    if (daysAgo <= 0) {
      return 'Today';
    }
    //check if daysAgo is equal to 1
    if (daysAgo === 1) {
      return 'Yesterday';
    }
    //check if daysAgo is greater than 1
    if (daysAgo > 1) {
      return `${daysAgo} dasy ago`;
    }
  });

  // Update userAward based on the number of posts

  //get the number of posts
  const numberOfPosts = posts.length;
  //check if the number of posts is less than 10
  if (numberOfPosts <= 0) {
    await User.findByIdAndUpdate(userId, {
      userAward: 'Bronze',
    });
  }
  //check if the number of posts is greater than 10
  if (numberOfPosts > 10) {
    await User.findByIdAndUpdate(userId, {
      userAward: 'Silver',
    });
  }

  //check if the number of posts is greater than 20
  if (numberOfPosts > 20) {
    await User.findByIdAndUpdate(userId, {
      userAward: 'Gold',
    });
  }

  next();
});

// Get fullName
userSchema.virtual('fullName').get(function () {
  return `${this.firstname} ${this.lastname}`;
});

// Get initials
userSchema.virtual('initials').get(function () {
  return `${this.firstname[0]}${this.lastname[0]}`;
});

// Post counts
userSchema.virtual('postCounts').get(function () {
  return this.posts.length;
});

//get followers count
userSchema.virtual('followersCount').get(function () {
  return this.followers.length;
});

//get followers count
userSchema.virtual('followingCount').get(function () {
  return this.following.length;
});

//get viewers count
userSchema.virtual('viewersCount').get(function () {
  return this.viewers.length;
});

//get blocked count
userSchema.virtual('blockedCount').get(function () {
  return this.blocked.length;
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

const User = model('User', userSchema);

export default User;
