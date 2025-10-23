import Joi from 'joi';
import { isValidObjectId, Schema } from 'mongoose';

export const contactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  phoneNumber: Joi.number().integer().required(),
  email: Joi.string().min(3).max(20).required(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().min(3).max(20).required(),

  userId: Joi.string().custom((value, helpers) => {
    if (!isValidObjectId(value)) {
      return helpers.message('User id must be a valid MongoDB ObjectId');
    }
    return value;
  }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  phoneNumber: Joi.number().integer(),
  email: Joi.string().min(3).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().min(3).max(20),
});
