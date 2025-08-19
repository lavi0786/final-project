import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";

// categories lookup
const CATEGORIES = {
  1: "Music",
  2: "Sports",
  3: "Technology",
  4: "Art",
  5: "Food",
};

export const EventPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  // Load event
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
          categoryIds: data.categoryIds.join(", "),
        });
      })
      .catch(() => toast({ title: "Failed to load event", status: "error" }));
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
          categoryIds: form.categoryIds
            .toString()
            .split(",")
            .map((id) => Number(id.trim())),
        }),
      });
      toast({ title: "Event updated", status: "success" });
      setEditMode(false);
    } catch {
      toast({ title: "Update failed", status: "error" });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await fetch(`http://localhost:3000/events/${eventId}`, {
          method: "DELETE",
        });
        toast({ title: "Event deleted", status: "success" });
        navigate("/");
      } catch {
        toast({ title: "Delete failed", status: "error" });
      }
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
            name="categoryIds"
            value={form.categoryIds}
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
          <Text>
            {event.startTime} – {event.endTime}
          </Text>
          <Text>
            Categories:{" "}
            {event.categoryIds?.map((id) => CATEGORIES[id]).join(", ")}
          </Text>
          <Button colorScheme="blue" mt={4} onClick={() => setEditMode(true)}>
            Edit
          </Button>
          <Button colorScheme="red" mt={4} ml={2} onClick={handleDelete}>
            Delete
          </Button>
        </>
      )}
    </Box>
  );
};
