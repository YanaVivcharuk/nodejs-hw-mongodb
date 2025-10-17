import { isValidObjectId } from 'mongoose';
import {
  getContacts,
  getContactById,
  createContact,
  deleteContact,
  updateContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { parseNumber } from '../utils/parseNumber.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getContactsController = async (req, res, next) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const contacts = await getContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId: req.user.id,
  });

  res.json({
    status: 200,
    message: 'Contacts get successfully!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;

  if (!isValidObjectId(contactId)) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid id',
      data: null,
    });
  }

  const contact = await getContactById(contactId, req.user._id);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  if (contact.userId.toString() !== req.user.id.toString()) {
    throw createHttpError(
      403,
      'You do not have permission to access this contact',
    );
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export async function createContactController(req, res, next) {
  const file = req.file;

  let photo;

  if (file) {
    photo = await saveFileToCloudinary(file);
  }

  const contact = await createContact({
    ...req.body,
    userId: req.user._id,
    photo,
  });

  res.status(201).json({
    status: 201,
    message: 'Contact created successfully!',
    data: contact,
  });
}

// DELETE
export async function deleteContactController(req, res, next) {
  const { contactId } = req.params;
  const result = await deleteContact(contactId, req.user._id);
  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
}

export async function patchContactController(req, res, next) {
  const { contactId } = req.params;

  const file = req.file;

  let photo;

  if (file) {
    photo = await saveFileToCloudinary(file);
  }

  const result = await updateContact(
    contactId,
    { ...req.body, photo },
    req.user._id,
  );
  if (!result) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result.contact,
  });
}
