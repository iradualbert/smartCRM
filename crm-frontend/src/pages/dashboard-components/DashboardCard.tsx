import { Box, Button, Card, CardActions, CardContent, Typography } from "@mui/material";
type CardElementProps = {
    cardTitle: string,
    value: number,
    borderBottomColor: "primary.main" | "success.main" | "warning.main" | "error.main" | "secondary.main" | "grey.500"
}


const DashboardCard = ({ cardTitle, value, borderBottomColor }: CardElementProps) => {
    return (
        <Box sx={{ minWidth: 275, borderBottomWidth: 2, borderBottomColor: borderBottomColor }}>
            <Card elevation={0}>
                <CardContent>
                    <Typography color="textSecondary" variant="h6" gutterBottom>
                        {cardTitle}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {value}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small">Learn More</Button>
                </CardActions>
            </Card>
        </Box>

    )
}

export default DashboardCard;