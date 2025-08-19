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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

// Example category mapping
const categoriesMap = {
  1: "Music",
  2: "Sports",
  3: "Tech",
  4: "Art",
};

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    startTime: "",
    endTime: "",
    categories: "",
  });

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch("http://localhost:3000/events");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        // Convert categoryIds → category names for UI
        const safeEvents = data.map((event) => ({
          ...event,
          categories: event.categoryIds
            ? event.categoryIds.map((id) => categoriesMap[id] || "Unknown")
            : [],
        }));

        setEvents(safeEvents);
      } catch (err) {
        toast({
          title: "⚠️ Could not load events",
          description: "Please check if JSON server is running.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    loadEvents();
  }, [toast]);

  // Apply search + category filter by NAME
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert labels → IDs for storage
    const categoryIds = form.categories
      .split(",")
      .map((c) => c.trim())
      .map(
        (label) =>
          Object.keys(categoriesMap).find(
            (id) => categoriesMap[id].toLowerCase() === label.toLowerCase()
          ) || null
      )
      .filter(Boolean)
      .map(Number);

    const newEvent = { ...form, categoryIds };

    try {
      await fetch("http://localhost:3000/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      toast({ title: "Event added", status: "success" });
      setForm({
        title: "",
        description: "",
        image: "",
        startTime: "",
        endTime: "",
        categories: "",
      });
      onClose();
      const res = await fetch("http://localhost:3000/events");
      const data = await res.json();
      setEvents(
        data.map((event) => ({
          ...event,
          categories: event.categoryIds
            ? event.categoryIds.map((id) => categoriesMap[id] || "Unknown")
            : [],
        }))
      );
    } catch {
      toast({ title: "Failed to add event", status: "error" });
    }
  };

  return (
    <Box p={4}>
      <Heading>List of Events</Heading>

      {/* Search bar */}
      <Input
        placeholder="Search events"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mt={4}
      />

      {/* Category filter */}
      <Select
        placeholder="Filter by category"
        mt={2}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        {Object.values(categoriesMap).map((cat, i) => (
          <option key={i} value={cat}>
            {cat}
          </option>
        ))}
      </Select>

      {/* Event list */}
      <Box mt={8}>
        {filteredEvents.length === 0 ? (
          <Box mt={4} p={4} bg="yellow.100" borderRadius="md">
            ⚠️ No events found. Try adjusting your search or filters.
          </Box>
        ) : (
          filteredEvents.map((event) => (
            <Box
              key={event.id}
              borderWidth="1px"
              borderRadius="md"
              p={4}
              mt={4}
            >
              <Heading size="md">
                <Link to={`/event/${event.id}`}>{event.title}</Link>
              </Heading>
              <p>{event.description}</p>
              <img src={event.image} alt={event.title} width="100%" />
              <p>
                {event.startTime} – {event.endTime}
              </p>
              <p>Categories: {event.categories.join(", ")}</p>

              {/* Edit button goes to details page */}
              <Button
                as={Link}
                to={`/event/${event.id}`}
                colorScheme="blue"
                size="sm"
                mt={2}
              >
                Edit
              </Button>
            </Box>
          ))
        )}
      </Box>

      {/* Add Event button + modal */}
      <Button colorScheme="teal" mt={8} onClick={onOpen}>
        Add New Event
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Event</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
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
                  placeholder="Categories (comma-separated, e.g., Music, Sports)"
                  value={form.categories}
                  onChange={handleChange}
                  required
                />
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="teal" type="submit">
                Add Event
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};
