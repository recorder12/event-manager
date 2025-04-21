import dbConnect from "@/lib/mongodb";
import {
  Organization,
  OrganizationDocument,
} from "../models/organization.schema";
import { UserRole } from "../models/user.schema";

type CreateOrganizationInput = {
  userId: string;
  role: UserRole;
  name: string;
  description?: string;
  type?: string;
  visibility?: string;
};

type GetOrganizationInput = {
  id: string;
};

export async function createOrganization({
  userId,
  role,
  name,
  description,
  type = "PERSONAL",
  visibility = "PUBLIC",
}: CreateOrganizationInput): Promise<OrganizationDocument> {
  try {
    if (role !== UserRole.ADMIN) {
      throw new Error("User is not authorized to create an organization");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }
    if (!name) {
      throw new Error("Name is required");
    }
    if (!description) {
      throw new Error("Description is required");
    }

    await dbConnect();

    const newOrganization = await Organization.create({
      owner: userId,
      name,
      description,
      type,
      visibility,
    });

    return newOrganization;
  } catch (error) {
    throw error;
  }
}

export async function findById({
  id,
}: GetOrganizationInput): Promise<OrganizationDocument> {
  try {
    await dbConnect();

    const result = await Organization.findById(id);
    if (!result) {
      throw new Error("Organization not found");
    }

    return result;
  } catch (error) {
    throw error;
  }
}
