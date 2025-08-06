import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";

export const EventPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // For AlertDialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const cancelRef = useRef();

  useEffect(() => {
    fetch(`http://localhost:3000/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setForm({
          title: data.title,
          description: data.description,
          image: data.image,
          startTime: data.startTime,
          endTime: data.endTime,
          categories: Array.isArray(data.categories)
            ? data.categories.join(", ")
            : data.categories || "",
        });
      });
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          categories: form.categories.split(",").map((c) => c.trim()),
        }),
      });
      toast({ title: "Event updated", status: "success" });
      setEditMode(false);
    } catch {
      toast({ title: "Update failed", status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "DELETE",
      });
      toast({ title: "Event deleted", status: "success" });
      navigate("/");
    } catch {
      toast({ title: "Delete failed", status: "error" });
    }
  };

  if (!event || !form) return <Text>Loading...</Text>;

  return (
    <Box p={4}>
      {editMode ? (
        <VStack spacing={4}>
          <Input name="title" value={form.title} onChange={handleChange} />
          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
          />
          <Input name="image" value={form.image} onChange={handleChange} />
          <Input
            name="startTime"
            type="datetime-local"
            value={form.startTime}
            onChange={handleChange}
          />
          <Input
            name="endTime"
            type="datetime-local"
            value={form.endTime}
            onChange={handleChange}
          />
          <Input
            name="categories"
            placeholder="Comma-separated categories"
            value={form.categories}
            onChange={handleChange}
          />
          <Button colorScheme="blue" onClick={handleUpdate}>
            Save
          </Button>
          <Button variant="ghost" onClick={() => setEditMode(false)}>
            Cancel
          </Button>
        </VStack>
      ) : (
        <>
          <Heading>{event.title}</Heading>
          <Text>{event.description}</Text>
          <img src={event.image} alt={event.title} width="100%" />
          <Text mt={2}>
            {event.startTime} – {event.endTime}
          </Text>
          <Text mt={2}>
            Categories:{" "}
            {Array.isArray(event.categories)
              ? event.categories.join(", ")
              : event.categories}
          </Text>
          {event.creator?.name && (
            <>
              <Text mt={2}>Created by: {event.creator.name}</Text>
              {event.creator.image && (
                <img
                  src={event.creator.image}
                  alt={event.creator.name}
                  width="50"
                />
              )}
            </>
          )}
          <Button colorScheme="blue" mt={4} onClick={() => setEditMode(true)}>
            Edit
          </Button>
          <Button
            colorScheme="red"
            mt={4}
            ml={2}
            onClick={() => setIsDialogOpen(true)}
          >
            Delete
          </Button>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Event
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this event? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  setIsDialogOpen(false);
                  handleDelete();
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
