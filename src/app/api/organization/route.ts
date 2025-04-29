// import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { UserRole } from "@/app/models/user.schema";
import { createOrganization } from "@/app/services/organization";
// import { authOptions } from "../auth/authOptions";

export async function POST(req: Request) {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session?.user?.id) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    // const userId = session.user.id;
    // const role = session.user.role as UserRole;
    // if (role !== UserRole.ADMIN) {
    //   return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    // }

    const { name, description } = await req.json();

    const newOrganization = await createOrganization({
      userId: "6805ace181bb9f8d8d580007",
      role: UserRole.ADMIN,
      name,
      description,
    });

    return NextResponse.json(
      { success: true, data: newOrganization },
      { status: 201 }
    );
  } catch (error: any) {
    return new Response(error.message, { status: 400 });
  }
}
