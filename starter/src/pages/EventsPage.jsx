import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  VStack,
  Textarea,
  useToast,
  Select,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    image: "",
    startTime: "",
    endTime: "",
    categories: "",
  });

  const toast = useToast();

  useEffect(() => {
    fetch("http://localhost:3000/events")
      .then((res) => res.json())
      .then((data) => {
        const safeEvents = data.map((event) => ({
          ...event,
          categories: Array.isArray(event.categories)
            ? event.categories
            : typeof event.categories === "string"
            ? event.categories.split(",").map((c) => c.trim())
            : [],
        }));
        setEvents(safeEvents);
      });
  }, []);

  const filteredEvents = events
    .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
    .filter((e) =>
      categoryFilter
        ? e.categories.some(
            (c) =>
              c.toLowerCase().trim() === categoryFilter.toLowerCase().trim()
          )
        : true
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleEdit = (event) => {
    setForm({
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.image,
      startTime: event.startTime,
      endTime: event.endTime,
      categories: Array.isArray(event.categories)
        ? event.categories.join(", ")
        : event.categories,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) return;

    try {
      await fetch(`http://localhost:3000/events/${id}`, { method: "DELETE" });
      toast({ title: "Event deleted", status: "success" });
      setEvents(events.filter((e) => e.id !== id));
    } catch {
      toast({ title: "Failed to delete event", status: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      categories: form.categories.split(",").map((c) => c.trim()),
    };

    const method = form.id ? "PUT" : "POST";
    const url = form.id
      ? `http://localhost:3000/events/${form.id}`
      : `http://localhost:3000/events`;

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast({
        title: form.id ? "Event updated" : "Event added",
        status: "success",
      });

      setForm({
        id: null,
        title: "",
        description: "",
        image: "",
        startTime: "",
        endTime: "",
        categories: "",
      });

      const res = await fetch("http://localhost:3000/events");
      const data = await res.json();
      setEvents(data);
    } catch {
      toast({
        title: "Failed to submit event",
        status: "error",
      });
    }
  };

  return (
    <Box p={4}>
      <Heading>List of events</Heading>

      <Input
        placeholder="Search events"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mt={4}
      />

      <Select
        placeholder="Filter by category"
        mt={2}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        {[
          ...new Set(
            events.flatMap((e) =>
              Array.isArray(e.categories)
                ? e.categories.map((c) => c.trim())
                : typeof e.categories === "string"
                ? e.categories.split(",").map((c) => c.trim())
                : []
            )
          ),
        ]
          .sort()
          .map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
      </Select>

      <Box mt={8}>
        {filteredEvents.map((event) => (
          <Box key={event.id} borderWidth="1px" borderRadius="md" p={4} mt={4}>
            <Heading size="md">
              <Link to={`/event/${event.id}`}>{event.title}</Link>
            </Heading>
            <p>{event.description}</p>
            <img src={event.image} alt={event.title} width="100%" />
            <p>
              {event.startTime} – {event.endTime}
            </p>
            <p>Categories: {event.categories.join(", ")}</p>
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => handleDelete(event.id)}
              mt={2}
            >
              Delete
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => handleEdit(event)}
              mt={2}
              ml={2}
            >
              Edit
            </Button>
          </Box>
        ))}
      </Box>

      <Box mt={12} p={4} borderWidth="1px" borderRadius="lg">
        <Heading size="md" mb={4}>
          {form.id ? "Edit Event" : "Add New Event"}
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={3}>
            <Input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
            />
            <Textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
            />
            <Input
              name="image"
              placeholder="Image URL"
              value={form.image}
              onChange={handleChange}
              required
            />
            <Input
              name="startTime"
              type="datetime-local"
              value={form.startTime}
              onChange={handleChange}
              required
            />
            <Input
              name="endTime"
              type="datetime-local"
              value={form.endTime}
              onChange={handleChange}
              required
            />
            <Input
              name="categories"
              placeholder="Categories (comma-separated)"
              value={form.categories}
              onChange={handleChange}
              required
            />
            <Button colorScheme="teal" type="submit">
              {form.id ? "Update Event" : "Add Event"}
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};
