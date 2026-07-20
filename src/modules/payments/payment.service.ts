import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { CreatePaymentPayload } from "./payments.interface";
import config from "../../config";


//  Create a Payment for an only accepted booking :

const createPayment = async (customerId: string, payload: CreatePaymentPayload) => {
  const { bookingId } = payload;

  if (!bookingId) {
    throw new Error("bookingId is required");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== customerId) {
    throw new Error("This booking does not belong to you");
  }

if (booking.status !== "ACCEPTED") {
  throw new Error(
    "Payment can only be made after the booking is accepted."
  );
}

  const alreadyPaid = await prisma.payment.findFirst({
    where: { bookingId, status: "COMPLETED" },
  });

  if (alreadyPaid) {
    throw new Error("This booking has already been paid for");
  }

  const amountInCents = Math.round(Number(booking.service.price) * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: booking.service.title },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id, customerId },
    success_url: `${config.app_url}/payment-success?bookingId=${booking.id}`,
    cancel_url: `${config.app_url}/payment-cancelled?bookingId=${booking.id}`,
  });


  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      transactionId: session.id,
      amount: booking.service.price,
      status: "PENDING",
    },
  });

  return {
    payment,
    checkoutUrl: session.url,
  };
};



const confirmPayment = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment = await prisma.payment.findUnique({
        where: {
          transactionId: session.id,
        },
      });

      if (!payment || payment.status === "COMPLETED") {
  return;
}

      await prisma.$transaction([
        prisma.payment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "COMPLETED",
            paidAt: new Date(),
          },
        }),

        prisma.booking.update({
          where: {
            id: payment.bookingId,
          },
          data: {
            status: "PAID", 
          },
        }),
      ]);

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;

      await prisma.payment.updateMany({
        where: {
          transactionId: session.id,
        },
        data: {
          status: "FAILED",
        },
      });

      break;
    }

    default:
      console.log(`Unhandled event: ${event.type}`);
  }
};

//  Get user's payment history ---
const getMyPayments = async (userId: string, role: "CUSTOMER" | "TECHNICIAN") => {
  if (role === "CUSTOMER") {
    return prisma.payment.findMany({
      where: { booking: { customerId: userId } },
      include: { booking: { include: { service: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  const technicianProfile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  return prisma.payment.findMany({
    where: { booking: { technicianId: technicianProfile.id } },
    include: { booking: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
  });
};

// Get single payment detail :
const getPaymentById = async (userId: string, role: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: { include: { service: true, technician: true } } },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const isOwner =
    (role === "CUSTOMER" && payment.booking.customerId === userId) ||
    (role === "TECHNICIAN" && payment.booking.technician.userId === userId);

  if (!isOwner) {
    throw new Error("You do not have access to this payment");
  }

  return payment;
};

export const paymentsServices = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};