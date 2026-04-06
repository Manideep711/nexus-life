import Request from "../models/Request.js";
import Resource from "../models/Resource.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";



/**
 * @desc Claim an offer or fulfill a need (Create a Match/Request)
 * @route POST /api/requests
 * @access Private
 */
export const createRequest = async (req, res) => {
  try {
    const { resourceId } = req.body;
    const initiatingUser = req.user;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    if (resource.user.toString() === initiatingUser._id.toString()) {
      return res.status(400).json({ message: "You cannot claim/fulfill your own post." });
    }

    // Donors fulfill Needs. Requesters claim Offers. Let's enforce that logic here:
    if (initiatingUser.role === "donor" && resource.postType !== "need") {
      return res.status(403).json({ message: "Donors can only fulfill needs." });
    }
    if (initiatingUser.role === "requester" && resource.postType !== "offer") {
      return res.status(403).json({ message: "Requesters can only claim offers." });
    }

    // Prevent duplicate requests for the same resource
    const existingRequest = await Request.findOne({
      initiatingUser: initiatingUser._id,
      resource: resourceId,
      status: { $in: ["pending", "accepted"] },
    });
    if (existingRequest) {
      return res.status(400).json({ message: "You already interacted with this resource." });
    }

    // Create new request
    const newRequest = await Request.create({
      initiatingUser: initiatingUser._id,
      receivingUser: resource.user, // The creator of the post
      resource: resourceId,
      status: "pending",
    });

    res.status(201).json({
      message: "Request sent successfully.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all requests received by user (where they are the creator of the post)
 * @route GET /api/requests/received
 * @access Private
 */
export const getReceivedRequests = async (req, res) => {
  try {
    const user = req.user;

    // ✅ Only fetch requests that are still pending
    const requests = await Request.find({
      receivingUser: user._id,
      status: "pending",
    })
      .populate("resource initiatingUser", "fullName email phone postType resourceType")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching received requests:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get all requests made by user (outgoing)
 * @route GET /api/requests/my
 * @access Private
 */
export const getMyRequests = async (req, res) => {
  try {
    const user = req.user;

    const requests = await Request.find({ initiatingUser: user._id })
      .populate("resource receivingUser", "fullName email phone postType resourceType")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update request status (accept/decline)
 * @route PATCH /api/requests/:id/respond
 * @access Private
 */
export const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const user = req.user;

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const request = await Request.findById(id)
      .populate("initiatingUser")
      .populate("resource");

    if (!request) return res.status(404).json({ message: "Request not found" });

    // Ensure the current user is the "receivingUser" (owner of the post)
    if (request.receivingUser.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this request." });
    }

    request.status = status;
    await request.save();

    // If accepted, mark resource as pending (or fulfilled)
    if (status === "accepted") {
      await Resource.findByIdAndUpdate(request.resource._id, { status: "pending" });

      // Create a chat if it doesn't exist
      const existingChat = await Chat.findOne({
        participants: { $all: [request.initiatingUser._id, user._id] },
      });

      if (!existingChat) {
        await Chat.create({
          participants: [request.initiatingUser._id, user._id],
          messages: [],
        });
      }
    }

    res.status(200).json({
      message: `Request ${status} successfully.`,
      request,
    });
  } catch (error) {
    console.error("Error in respondToRequest:", error);
    res.status(500).json({ message: error.message });
  }
};