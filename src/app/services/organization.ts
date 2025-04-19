import dbConnect from "@/lib/mongodb";
import {
  Organization,
  OrganizationDocument,
} from "../models/organization.schema";

type GetOrganizationInput = {
  id: string;
};

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
