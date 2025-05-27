import {
    Box, Button, Tooltip, Text, Menu,
    MenuButton,
    Avatar,
    MenuItem,
    MenuList,
    MenuDivider,
    Drawer,
    useDisclosure,
    DrawerContent,
    DrawerOverlay,
    DrawerHeader,
    DrawerBody,
    Input,
    useToast,
    Spinner,
} from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { ChatState } from '../../Context/ChatProvider';
import { ProfileModal } from './ProfileModel';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { ChatLoading } from '../ChatLoading';
import { UserListItem } from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
// import NotificationBadge, { Effect } from 'react-notification-badge';
import { Badge } from "@chakra-ui/react";



const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();

    const { user, setSelectedChat, chats, setChats,
        notification, setNotification } = ChatState();
    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push("/");
    };
    const toast = useToast();

    const handleSearch = async () => { 
        if (!search) {
            toast({
                title: "Please enter something in search",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top-left",
            });
            return;
        }
        
        try {
            setLoading(true)

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResults(data);

        } catch (error) { 
            toast({
                title: "Error Occured!",
                description: "Failed to load the search results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });

        }

        

    };

    const accessChat = async (userId) => { 

        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post('/api/chat', { userId }, config);

            if (!chats.find((c) => c._id === data._id))
                setChats([data, ...chats]);

            setSelectedChat(data);
            setLoadingChat(false);
            onClose();

        } catch (error) { 
            toast({
                title: "Error Occured!",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });

        }

    }



    return (
        <>
            <Box
               display="flex"
                justifyContent="space-between"
                alignItems="center"
                bg="white"
                w="100%"
                p="5px 10px 5px 10px"
                borderWidth="5px"

            >
                <Tooltip
                    label="Search Users to chat"
                    hasArrow placement="bottom-end"
                >
                    <Button variant="ghost" onClick={onOpen}> 
                        <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: "#000000", }} />
                        <Text display={{base:"none", md:"flex"}} px="4" >
                            Search User
                        </Text>

                   </Button>
                </Tooltip>

                <Text fontSize="2xl" fontFamily="Work sans">
                Talk-a-Tive
                </Text>
                <div>
                <Menu>
  <MenuButton p={1} position="relative">
    {notification.length > 0 && (
      <Badge
        colorScheme="red"
        borderRadius="full"
        position="absolute"
        top="-1"
        right="-1"
        fontSize="0.8em"
      >
        {notification.length}
      </Badge>
    )}
    <BellIcon fontSize="2xl" m={1} />
  </MenuButton>
  <MenuList pl={2}>
  {!notification.length && "No new messages"}
  {notification.map((notif) => (
    <MenuItem
      key={notif._id}
      onClick={() => {
        setSelectedChat(notif.chat);
        setNotification(notification.filter((n) => n !== notif));
      }}
    >
      {notif.chat.isGroupChat
        ? `New Message in ${notif.chat.chatName}`
        : `New Message from ${getSender(user, notif.chat.users)}`}
    </MenuItem>
  ))}
</MenuList>

</Menu>


 <Menu>
 <MenuButton
 as={Button}
rightIcon={<ChevronDownIcon />}>
<Avatar size="sm"
  cursor="pointer"
name={user.name}
src={user.pic} />
                            
 </MenuButton>
                        
                        <MenuList >
                        <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                                </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                        

                </div>
        </Box>

        <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
  <DrawerOverlay />
  <DrawerContent>
    <Box borderBottomWidth="1px">
      <Text p={4} fontWeight="bold">Search Users</Text>
                    </Box>
                    <DrawerBody>
                    <Box display="flex" paddingBottom={2} >
                        <Input
                            placeholder='Search by name or email'
                            mr={2}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                            onClick={handleSearch}
                        >
                            Go
                        </Button>

                        </Box>
                        {loading ? <ChatLoading /> : 
                            (
                                searchResults?.map(user => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => accessChat(user._id)} 
                                    />
                                ) )
                            )}
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                </DrawerBody>
     </DrawerContent>
           
</Drawer>

        </>
    );
};

export default SideDrawer;