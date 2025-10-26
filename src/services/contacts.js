import { Contact } from '../models/contact.js';
import { SORT_ORDER } from '../constants/index.js';
import createHttpError from 'http-errors';

export async function getContacts({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  filter = {},
  userId,
}) {
  const skip = page > 0 ? (page - 1) * perPage : 0;
  const limit = perPage;

  const [contacts, totalItems] = await Promise.all([
    Contact.find({ userId })
      .skip(skip)
      .limit(perPage)
      .sort({ [sortBy]: sortOrder })
      .exec(),
    Contact.countDocuments({ userId }),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data: contacts,
    page,
    perPage,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: totalPages > page,
  };
}

export async function getContactById(contactId, userId) {
  const contact = await Contact.findOne({ _id: contactId, userId: userId });
  return contact;
}

export async function createContact(payload) {
  return Contact.create(payload);
}

export async function deleteContact(contactId, userId) {
  const contact = await Contact.findOneAndDelete({ _id: contactId, userId });
  return contact;
}

export async function updateContact(contactId, payload, userId, options = {}) {
  if (payload.email) {
    const existing = await Contact.findOne({ email: payload.email, userId });
    if (existing && existing._id.toString() !== contactId) {
      throw createHttpError(409, 'Email in use');
    }
  }

  let updatedContact;
  try {
    updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, userId },
      { $set: payload },
      { new: true, runValidators: true, ...options },
    );
  } catch (error) {
    if (error.code === 11000 && !payload.email) {
      updatedContact = await Contact.findOne({ _id: contactId, userId });
    } else {
      throw error;
    }
  }

  if (!updatedContact) return null;

  return {
    contact: updatedContact,
    isNew: false,
  };
}
