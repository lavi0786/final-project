// import React from 'react';
// import { Link } from 'react-router-dom';

// export const Navigation = () => {
//   return (
//     <nav>
//       <ul>
//         <li>
//           <Link to="/">Events</Link>
//         </li>
//         <li>
//           <Link to="/event/1">Event</Link>
//         </li>
//       </ul>
//     </nav>
//   );
// };

import React from "react";
import { Link } from "react-router-dom";
import { Flex, Box, Button } from "@chakra-ui/react";

export const Navigation = () => {
  return (
    <Flex as="nav" p={4} bg="gray.100" justify="space-between">
      <Box>
        <Button as={Link} to="/" variant="link" colorScheme="teal">
          Events
        </Button>
      </Box>
    </Flex>
  );
};
