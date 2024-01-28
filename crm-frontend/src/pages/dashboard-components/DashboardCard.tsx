import { Box, Card, CardContent, Typography } from "@mui/material";
type CardElementProps = {
    cardTitle: string,
    value: number,
    borderBottomColor: "primary.main" | "success.main" | "warning.main" | "error.main" | "secondary.main" | "grey.500"
}


const DashboardCard = ({ cardTitle, value, borderBottomColor }: CardElementProps) => {
    return (
        <Box sx={{ width: 200, borderWidth: 1, borderColor: borderBottomColor, borderRadius: 1 }}>
            <Card elevation={0}>
                <CardContent>
                    <Typography color="textSecondary" variant="h6" gutterBottom>
                        {cardTitle}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {value}
                    </Typography>
                </CardContent>
            </Card>
        </Box>

    )
}

export default DashboardCard;