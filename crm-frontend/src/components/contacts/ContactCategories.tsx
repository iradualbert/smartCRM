import { Button } from "@/components/ui/button";
import ContactCategoryForm from "./ContactCategoryForm";
import { Divider, List, ListItem, ListItemText } from "@mui/material";

const ContactCategories = ({ categories }) => {

    return (
        <div>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <ListItem alignItems="flex-start" >
                    <ListItemText
                        primary={`All`}
                    />
                </ListItem>
                {categories?.results?.map(category => {
                    return (
                        <div key={category.id}>
                            <ListItem alignItems="flex-start" >
                                <ListItemText
                                    primary={category.name} 
                                    secondary={<span>{category.total_contacts}</span>}
                                />
                                
                                <div className="flex gap-4">
                                    <ContactCategoryForm>Edit</ContactCategoryForm>
                                    <Button>View Contacts</Button>
                                    <Button>Send Emails</Button>
                                    <Button>Send Webinar Meeting Link</Button>
                                </div>
                            </ListItem>
                            <Divider component="li" />
                        </div>
                    )
                })}

            </List>
            <ContactCategoryForm isCreate>+New Category</ContactCategoryForm>
        </div>
    )
}

export default ContactCategories;