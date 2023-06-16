import commentService from '../services/comment.service.js';

class CommentController {
  async createComment(req, res, next) {
    try {
      const comment = await commentService(req.params.id, req.user, req.body.description);
      return res.status(201).json({
        status: 'success',
        comment,
      });
    } catch (e) {
      next(e);
    }
  }

  async deleteComment(req, res, next) {
    try {
      await commentService.deleteComment(req.params.id, req.user);
      return res.status(200).json({
        success: 'true',
        message: 'Comment deleted successfully',
      });
    } catch (e) {
      next(e);
    }
  }

  async updateComment(req, res, next) {
    try {
      const { description } = req.body;
      const updatedComment = await commentService.updateComment(
        req.params.id,
        req.user._id,
        description,
      );
      return res.status(200).json({
        status: 'success',
        updatedComment,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new CommentController();
