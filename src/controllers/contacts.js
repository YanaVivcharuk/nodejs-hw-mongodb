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

export const getContactsController = async (req, res, next) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query); // 👈 фільтрація

  const contacts = await getContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.json({
    status: 200,
    message: 'Contacts get successfully!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { id } = req.params;

  console.log('ID:', id, 'isValid:', isValidObjectId(id));

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid id',
      data: null,
    });
  }

  const contact = await getContactById(id);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${id}!`,
    data: contact,
  });
};

export async function createContactController(req, res, next) {
  const contact = await createContact(req.body);

  res.status(201).json({
    status: 201,
    message: 'Contact created successfully!',
    data: contact,
  });
}

export async function deleteContactController(req, res, next) {
  const { id } = req.params;

  const result = await deleteContact(id);

  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
}

export async function patchContactController(req, res, next) {
  const { id } = req.params;

  const result = await updateContact(id, req.body);
  console.log('result:', result);

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
