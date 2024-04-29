import AbstractDocument from './AbstractDocument';
export default class User implements AbstractDocument {
  id?: string;
  name: string;
  password: string;

  constructor(name: string, password: string) {
    this.name = name;
    this.password = password;
  }

  toFirestore(id?: string) {
    return {
      id: id || this.id,
      name: this.name,
      password: this.password,
    };
  }
}
