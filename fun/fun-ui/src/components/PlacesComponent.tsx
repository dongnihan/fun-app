import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Button from '@mui/material/Button';
import PlacesService from "../services/PlacesService.tsx";
import { DataGrid, GridCallbackDetails, GridCellParams, GridToolbar, MuiEvent } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Link from "@mui/material/Link";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import PoiMarkersComponent from "./PoiMarkers.tsx";
import { Poi } from "../models/Poi.tsx";
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import { IconButton, Stack, styled, Tooltip, Typography } from "@mui/material";
import NearMeIcon from '@mui/icons-material/NearMe';
import React from "react";

const PRICE_LEVELS = [
    "UNSPECIFIED",
    "INEXPENSIVE",
    "MODERATE",
    "EXPENSIVE",
    "VERY_EXPENSIVE" 
]
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
const API_KEY = "AIzaSyDCOMH-kd4AjNhs5irUe1846gfUKnm2H4o";
const MAP_ID = 'e6bcc7519ce12c81';
const COLUMNS = [
    {field: 'id', headerName: 'ID', width: 50},
    {field: 'rating', headerName: 'Rating', width: 100},
    {field: 'reviewCount', headerName: 'Review Count', width: 120},
    {field: 'name', headerName: 'Name', width: 200},
    {field: 'priceLevel', headerName: 'Price Level', width: 120},
    {field: 'websiteUrl', headerName: 'Website URL', width: 150, renderCell: (params) => (<Link href={`${params.value}`}>{params.value!.toString()}</Link>)},
    {field: 'googleMapLink', headerName: 'Google Map Link', width: 300, renderCell: (params) => (<Link href={`${params.value}`}>{params.value!.toString()}</Link>)},
    {field: 'address', headerName: 'Address', width: 300}
];
const PAGE_SIZE = 50;

function tabProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}
  
function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        >
        {value === index && <Box>{children}</Box>}
        </div>
    );
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
  }));

function roundToTwo(num: number): number {
    return parseFloat(num.toFixed(2));
}  

export default function PlacesComponent() {
    const [priceLevels, setPriceLevels] = useState(["INEXPENSIVE", "MODERATE"]);
    const [minRating, setMinRating] = useState<number>(4.5);
    const [places, setPlaces] = useState<{}[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [latitude, setLatitude] = useState(40.71640885987045);
    const [longitude, setLongitude] = useState(-74.04880009206865);
    const [locations, setLocations] = useState<Poi[]>([]);
    const [radius, setRadius] = useState(0);
    const [zoom, setZoom] = useState(13);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isCurrentLoacationLoading, setIsCurrentLoacationLoading] = useState(false);
    const [includedTypes, setIncludedTypes] = useState([]);
    const [selectedIncludedTypes, setSelectedIncludedTypes] = useState([]);
    
    useEffect(() => {
        // This code will run only once after the initial render}
        async function fetchData() {
            try {
                const response = (await PlacesService.getIncludedTypes()).data;
                setIncludedTypes(response);
            }catch(e) {
                console.error(e);
            }
        }
        setLocations([{key: 'original', location: {lat: latitude, lng: longitude}}]);
        fetchData();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handlePriceLevelChange = (event) => {
        const {
          target: { value },
        } = event;
        setPriceLevels(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value
        );
      };
    
    const handleMinRatingChange = (event) => {
        setMinRating(event.target.value);
    }
    
    const handleTextSearchClick = async (event) => {
        event.preventDefault();
        const data = {
            textQuery: (document.getElementById('search-text') as HTMLInputElement).value,
            pageSize: (document.getElementById('page-size') as HTMLInputElement).value,
            priceLevels: priceLevels.map((item) => "PRICE_LEVEL_" + item),
            minRating: minRating
        }
        try {
            const response = (await PlacesService.getPlacesByTextSearch(data)).data;
            setPlaces(response);
        }catch(e) {
            console.error(e);
        }
    }

    const handleNearbySearchClick = async (event) => {
        event.preventDefault();
        setIsSearchLoading(true);

        const data = {
            latitude: roundToTwo(latitude),
            longitude: roundToTwo(longitude),
            distance: (document.getElementById('distance') as HTMLInputElement).value,
            includedTypes: selectedIncludedTypes
        }

        const newLocations: Poi[] = [];

        try {
            const response = (await PlacesService.getPlacesByNearbySearch(data)).data;
            setPlaces(response);

            response.slice(0, PAGE_SIZE).forEach((r: any) => {
                newLocations.push({key: r["latitude"] + "-" + r["longitude"], location: {lat: r["latitude"], lng: r["longitude"]}}); 
            });
            
            setLocations(newLocations);
            if (newLocations.length > 1) {
                setZoom(18);
            }
        }catch(e) {
            console.error(e);
        }finally {
            setIsSearchLoading(false);
        }
    }

    const handleRadius = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRadius(parseInt(event.target.value));
    }

    const handlePagination = (params) => {
        const page = parseInt(params["page"]);
        const newLocations: Poi[] = [];
        places.slice(PAGE_SIZE * page, PAGE_SIZE * (page + 1)).forEach((r: any) => {
            newLocations.push({key: r["latitude"] + "-" + r["longitude"], location: {lat: r["latitude"], lng: r["longitude"]}}); 
        });
        
        setLocations(newLocations);
        if (newLocations.length > 1) {
            setZoom(18);
        }
    }
    
    const handleCurrentLocation = (params) => {
        if (navigator.geolocation) {
            setIsCurrentLoacationLoading(true);
            navigator.geolocation.getCurrentPosition(updatePosition);
        }
    } 

    function updatePosition(position) {
        if (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;  
            setLatitude(lat);
            setLongitude(lon);
            setLocations([{key: 'original', location: {lat: lat, lng: lon}}]);
            setIsCurrentLoacationLoading(false);
        }
    }

    const onClickMap = (ev) => {
        const clickedLat = ev.detail.latLng.lat;
        const clickedLng = ev.detail.latLng.lng;
        setLatitude(clickedLat);
        setLongitude(clickedLng);
        setLocations([{key: 'original', location: {lat: clickedLat, lng: clickedLng}}]);
    }

    const handleIncludedTypesChange = (event) => {
        const {
            target: { value },
        } = event;
        setSelectedIncludedTypes(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value
        );
    }

    const handleCellClick = (params: GridCellParams, event: MuiEvent, details: GridCallbackDetails) => {
        if ((params.field === 'websiteUrl' || params.field === 'googleMapLink') && params.value) {
            // Extract the native event from MuiEvent
            const nativeEvent = event as unknown as React.MouseEvent;

            // Prevent default action if necessary
            if (nativeEvent.preventDefault) {
                nativeEvent.preventDefault();
            }

            window.open(String(params.value), "_blank");
        }

    }

    return (
        <div>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid size={4}>
                        <Item>
                            {latitude !== 0.0 && longitude !== 0.0 &&
                            <Box sx={{ height: '100vh', width: '100%' }}>
                                <APIProvider apiKey={API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
                                    <Map
                                        defaultZoom={zoom}
                                        defaultCenter={ { lat: latitude, lng: longitude } }
                                        mapId={MAP_ID}
                                        onClick={onClickMap}
                                    >
                                    </Map>
                                    <PoiMarkersComponent pois={locations} radius={radius} />
                                </APIProvider>
                            </Box>}
                        </Item>
                    </Grid>
                    <Grid size={8}>
                        <Item>
                            <Tabs value={tabValue} onChange={handleTabChange}>
                                <Tab label="Nearby Search" {...tabProps(0)} />
                                <Tab label="Text Search" {...tabProps(1)} />
                            </Tabs>

                            <CustomTabPanel value={tabValue} index={0}>
                                <Stack spacing={2} direction="row" useFlexGap sx={{ flexWrap: 'wrap' }} style={{alignItems: 'center'}}>
                                    <TextField 
                                        required 
                                        id="distance" 
                                        label="Distance(meters)" 
                                        type="search" 
                                        variant="standard" 
                                        onChange={handleRadius}
                                        style={{ width: '150px', height: '50px', marginTop: '10px' }}
                                    />
                                    <FormControl sx={{ m: 1, width: 400, height: '50px' }}>
                                        <InputLabel>Included Types</InputLabel>
                                        <Select
                                            multiple
                                            value={selectedIncludedTypes}
                                            onChange={(event) => handleIncludedTypesChange(event)}
                                            input={<OutlinedInput label="Included Types" />}
                                            renderValue={(selected) => selected.join(',')}
                                            MenuProps={MenuProps}
                                        >
                                        {includedTypes.map((type) => (
                                            <MenuItem key={type} value={type}>
                                            <Checkbox checked={selectedIncludedTypes.includes(type)} />
                                            <ListItemText primary={type} />
                                            </MenuItem>
                                        ))}
                                        </Select>
                                    </FormControl>
                                   
                                    <Button 
                                        style={{height: '40px', marginTop: '8px'}}
                                        variant="contained" 
                                        onClick={handleNearbySearchClick} 
                                        disabled={latitude === 0 || longitude === 0 || radius === 0}
                                        loading={isSearchLoading}
                                    >
                                        Search
                                    </Button>
                                </Stack>
                                <Stack spacing={2} direction="row" useFlexGap sx={{ flexWrap: 'wrap' }} style={{alignItems: 'center'}}>
                                    <Tooltip title="Use current location">
                                        <IconButton onClick={handleCurrentLocation} loading={isCurrentLoacationLoading}>
                                            <NearMeIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <Typography>Latitude:{latitude}</Typography>
                                    <Typography>Longitude:{longitude}</Typography>
                                    
                                </Stack>

                                <Box sx={{ height: '87vh', width: '100%', marginTop: '5px' }}>
                                    <DataGrid
                                        rows={places}
                                        columns={COLUMNS}
                                        initialState={{
                                            pagination: {
                                                paginationModel: {
                                                    pageSize: PAGE_SIZE
                                                }
                                            }
                                        }}
                                        pageSizeOptions={[PAGE_SIZE]}
                                        checkboxSelection
                                        disableRowSelectionOnClick
                                        slots={{ toolbar: GridToolbar }}
                                        onPaginationModelChange={handlePagination}
                                        onCellClick={handleCellClick}
                                    />
                                </Box>
                            </CustomTabPanel>

                            <CustomTabPanel value={tabValue} index={1}>
                                <FormControl sx={{ m: 1, width: 400}}>
                                    <TextField required id="search-text" label="Search text" type="search" variant="standard" />
                                </FormControl>

                                <FormControl sx={{ m: 1, width: 100}}>
                                    <TextField id="page-size" label="# of result" type="search" defaultValue="30" variant="standard" />
                                </FormControl>
                                
                                <FormControl sx={{ m: 1, width: 400 }}>
                                    <InputLabel id="price-level-checkbox-label">Price Level</InputLabel>
                                    <Select 
                                        labelId="price-level-checkbox-label"
                                        id="price-level-checkbox"
                                        multiple
                                        value={priceLevels}
                                        onChange={handlePriceLevelChange}
                                        input={<OutlinedInput label="Price Level" />}
                                        renderValue={(selected) => selected.join(',')}
                                        MenuProps={MenuProps}
                                    >
                                        {PRICE_LEVELS.map((priceLevel) => (
                                            <MenuItem key={priceLevel} value={priceLevel}>
                                                <Checkbox checked={priceLevels.includes(priceLevel)} />
                                                <ListItemText primary={priceLevel} />
                                            </MenuItem>
                                        ))}

                                    </Select>
                                </FormControl>
                                        
                                <FormControl sx={{ m: 1, minWidth: 120 }}>
                                    <InputLabel id="min-rating-label">Min Rating</InputLabel>
                                    <Select
                                        labelId="min-rating-label"
                                        id="min-rating"
                                        value={minRating}
                                        onChange={handleMinRatingChange}
                                        label="Min Rating"
                                        defaultValue={4.5}
                                        >
                                        <MenuItem value={4.1}>4.1</MenuItem>
                                        <MenuItem value={4.2}>4.2</MenuItem>
                                        <MenuItem value={4.3}>4.3</MenuItem>
                                        <MenuItem value={4.4}>4.4</MenuItem>
                                        <MenuItem value={4.5}>4.5</MenuItem>
                                        <MenuItem value={4.6}>4.6</MenuItem>
                                        <MenuItem value={4.7}>4.7</MenuItem>
                                        <MenuItem value={4.8}>4.8</MenuItem>
                                        <MenuItem value={4.9}>4.9</MenuItem>
                                        <MenuItem value={5.0}>5.0</MenuItem>
                                    </Select>
                                </FormControl>
                                
                                <FormControl sx={{ m: 1, top: '10px' }}>
                                    <Button variant="contained" onClick={handleTextSearchClick}>Search</Button>
                                </FormControl>

                                <Box sx={{ height: '85vh', width: '100%' }}>
                                    <DataGrid
                                        rows={places}
                                        columns={COLUMNS}
                                        initialState={{
                                            pagination: {
                                                paginationModel: {
                                                    pageSize: 50
                                                }
                                            }
                                        }}
                                        pageSizeOptions={[50]}
                                        checkboxSelection
                                        disableRowSelectionOnClick
                                    />
                                </Box>
                            </CustomTabPanel>
                        </Item>
                    </Grid>
                </Grid>
            </Box>

        </div>
    );
    
}