import React from 'react';
import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { TbHomeSearch } from 'react-icons/tb';

import RequestForm from '../../../forms/RequestForm';

const Request = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <div className="border dark:border-dark mt-3">
      <div className="flex flex-col justify-center items-center p-3 gap-2">
        <span className="flex justify-center items-center gap-2">
          <TbHomeSearch className="text-[2rem]" />
          <p className="text-sm">Can't find the property you're looking for</p>
        </span>
        <Button
          onClick={onOpen}
          color="#02293E"
          backgroundColor="#F7751E"
          _hover={{ color: 'white', backgroundColor: '#02293E' }}
        >
          POST A REQUEST
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          closeOnOverlayClick={false}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader color="#02293E">Property Request Form</ModalHeader>
            <ModalCloseButton />
            <ModalBody color="#12121">
              <RequestForm />
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={onClose}
                backgroundColor="#F7751E"
                _hover={{ color: 'white', backgroundColor: '#02293E' }}
              >
                Close
              </Button>
              <Button
                variant="ghost"
                backgroundColor="#02293E"
                color="white"
                _hover={{ color: 'white', backgroundColor: '#F7751E' }}
              >
                SUBMIT
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default Request;
