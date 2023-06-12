export default class UserPayloadDto {
  constructor(model) {
    this.email = model.email;
    this.id = model._id;
    this.isActicated = model.isActicated;
  }
}
