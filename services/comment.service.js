import CommentModal from '../models/comment.model.js';
import PostModal from '../models/post.model.js';
import ApiError from './appError.js';

class CommentService {
  async createComment(postId, user, description) {
    const post = await PostModal.findById(postId);
    const comment = await CommentModal.create({ post: postId, description, user: user._id });
    post.comments.push(comment._id);
    user.comments.push(comment._id);
    await post.save();
    await user.save();
    return comment;
  }

  async deleteComment(commentId, user) {
    const comment = await CommentModal.findById(commentId);
    if (!comment) {
      throw ApiError.BadRequest('Comment not Found');
    }
    if (comment.user.toString() === user._id.toString() || user.role === 'Admin') {
      const deletedComment = await PostModal.findByIdAndRemove(commentId);
      return deletedComment;
    } else {
      throw ApiError.UnauthorizedError();
    }
  }

  async updateComment(commentId, userId, description) {
    const comment = await CommentModal.findById(commentId);
    if (!comment) {
      throw ApiError.BadRequest('Comment not Found');
    }
    if (commentId.toString() !== userId.toString()) {
      throw ApiError.UnauthorizedError();
    }
    const updatedComment = await CommentModal.findByIdAndUpdate(commentId, description, {
      new: true,
      runValidators: true,
    });
    return updatedComment;
  }
}

export default new CommentService();
