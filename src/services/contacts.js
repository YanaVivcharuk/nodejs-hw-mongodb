import { Contact } from '../models/contact.js';

export async function getContacts() {
  const contacts = await Contact.find();
  return contacts;
}

export async function getContactById(id) {
  const contact = await Contact.findById(id);
  return contact;
}

export async function createContact(payload) {
  return Contact.create(payload);
}

export async function deleteContact(id) {
  const contact = await Contact.findByIdAndDelete(id);
  return contact;
}

export async function updateContact(id, payload, options = {}) {
  const updatedContact = await Contact.findOneAndUpdate(
    {
      _id: id,
    },
    payload,
    {
      new: true,

      ...options,
    },
  );

  if (!updatedContact) return null;

  return {
    contact: updatedContact,
    isNew: false,
  };
}
