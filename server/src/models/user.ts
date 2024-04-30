import AbstractDocument from './AbstractDocument';

export type UserAttributes = {
  id: string;
  name: string;
  salle: number | null;
};

export default class User implements AbstractDocument {
  id: UserAttributes['id'];
  name: UserAttributes['name'];
  salle: UserAttributes['salle'];

  constructor(name?: string) {
    this.id = '-1';
    this.name = name || 'Anonymous';
    this.salle = null;
  }

  toFirestore(): UserAttributes {
    return {
      id: this.id,
      name: this.name,
      salle: this.salle,
    };
  }

  static fromFirestore(attributes: UserAttributes) {
    const user = new User();
    user.id = attributes.id;
    user.name = attributes.name;
    user.salle = attributes.salle;

    return user;
  }
}
