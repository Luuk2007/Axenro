
import React from 'react';
import { Camera, ChevronDown, Filter, Plus, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressChart from '@/components/dashboard/ProgressChart';

const weightData = [
  { date: 'Jun 1', value: 78.5 },
  { date: 'Jun 8', value: 78.2 },
  { date: 'Jun 15', value: 77.8 },
  { date: 'Jun 22', value: 77.3 },
  { date: 'Jun 29', value: 76.9 },
  { date: 'Jul 6', value: 76.5 },
  { date: 'Jul 13', value: 76.4 },
];

const bodyMeasurements = [
  { name: 'Chest', current: '96 cm', previous: '98 cm', change: -2, isPositive: true },
  { name: 'Waist', current: '83 cm', previous: '85 cm', change: -2, isPositive: true },
  { name: 'Hips', current: '100 cm', previous: '101 cm', change: -1, isPositive: true },
  { name: 'Left Arm', current: '35 cm', previous: '34 cm', change: 1, isPositive: true },
  { name: 'Right Arm', current: '35.5 cm', previous: '34.5 cm', change: 1, isPositive: true },
  { name: 'Left Thigh', current: '56 cm', previous: '55 cm', change: 1, isPositive: true },
  { name: 'Right Thigh', current: '56.5 cm', previous: '55.5 cm', change: 1, isPositive: true },
];

const progressPhotos = [
  { 
    id: '1', 
    date: 'May 1, 2023', 
    frontImage: 'https://placehold.co/300x400/e9ecef/6c757d?text=Front+View',
    sideImage: 'https://placehold.co/300x400/e9ecef/6c757d?text=Side+View',
    backImage: 'https://placehold.co/300x400/e9ecef/6c757d?text=Back+View',
    weight: '78.5 kg'
  },
  { 
    id: '2', 
    date: 'June 1, 2023', 
    frontImage: 'https://placehold.co/300x400/e9ecef/6c757d?text=Front+View',
    sideImage: 'https://placehold.co/300x400/e9ecef/6c757d?text=Side+View',
    backImage: 'https://placehold.co/300x400/e9ecef/6c757d?text=Back+View',
    weight: '77.2 kg'
  },
  { 
    id: '3', 
    date: 'July 1, 2023', 
    frontImage: 'https://placehold.co/300x400/e9ecef/6c757d?text=Front+View',
    sideImage: 'https://placehold.co/300x400/e9ecef/6c757d?text=Side+View',
    backImage: 'https://placehold.co/300x400/e9ecef/6c757d?text=Back+View',
    weight: '76.4 kg'
  },
];

const Progress = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Progress Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your body measurements and physical changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Measurement
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="photos">Progress Photos</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ProgressChart
              title="Weight Progress"
              data={weightData}
              label="kg"
              color="#4F46E5"
            />
            
            <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-medium tracking-tight">Latest Measurements</h3>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {bodyMeasurements.slice(0, 4).map((measurement, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between bg-secondary/30 rounded-lg p-3"
                    >
                      <p className="font-medium">{measurement.name}</p>
                      <div className="flex items-center">
                        <p className="text-sm font-semibold mr-3">{measurement.current}</p>
                        <div className={`flex items-center text-xs ${
                          measurement.isPositive ? "text-green-500" : "text-red-500"
                        }`}>
                          <span>{measurement.change > 0 ? "+" : ""}{measurement.change} cm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-medium tracking-tight">Recent Progress Photos</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {progressPhotos.slice(0, 1).map((entry) => (
                  <React.Fragment key={entry.id}>
                    <div className="overflow-hidden rounded-lg relative group">
                      <img
                        src={entry.frontImage}
                        alt="Front view"
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-lg relative group">
                      <img
                        src={entry.sideImage}
                        alt="Side view"
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-lg relative group">
                      <img
                        src={entry.backImage}
                        alt="Back view"
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="sm">
                  View All Photos
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="measurements" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-medium tracking-tight">Body Measurements</h3>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="divide-y divide-border">
                {bodyMeasurements.map((measurement, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4"
                  >
                    <p className="font-medium">{measurement.name}</p>
                    <div className="flex items-center">
                      <p className="text-sm font-semibold mr-4">{measurement.current}</p>
                      <div className={`flex items-center text-xs ${
                        measurement.isPositive ? "text-green-500" : "text-red-500"
                      }`}>
                        <span>{measurement.change > 0 ? "+" : ""}{measurement.change} cm</span>
                        <span className="text-muted-foreground ml-1">from {measurement.previous}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <ProgressChart
                title="Weight Progress"
                data={weightData}
                label="kg"
                color="#4F46E5"
              />
              
              <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-medium tracking-tight">Weight Log</h3>
                </div>
                <div className="p-4 flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Current Weight
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        placeholder="Enter weight"
                        className="border border-input rounded-l-md bg-transparent px-3 py-2 text-sm w-full"
                      />
                      <div className="border-t border-r border-b border-input rounded-r-md px-3 py-2 text-sm bg-secondary/30">
                        kg
                      </div>
                    </div>
                  </div>
                  <Button className="shrink-0">Save</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="photos" className="mt-6">
          <div className="glassy-card rounded-xl overflow-hidden card-shadow hover-scale mb-6">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-medium tracking-tight">Progress Photos</h3>
              <Button>
                <Camera className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="flex overflow-hidden rounded-lg border border-input">
                  <button className="bg-primary text-white px-4 py-2 text-sm">
                    All Photos
                  </button>
                  <button className="bg-transparent hover:bg-secondary px-4 py-2 text-sm">
                    Front View
                  </button>
                  <button className="bg-transparent hover:bg-secondary px-4 py-2 text-sm">
                    Side View
                  </button>
                  <button className="bg-transparent hover:bg-secondary px-4 py-2 text-sm">
                    Back View
                  </button>
                </div>
              </div>
              
              {progressPhotos.map((entry) => (
                <div key={entry.id} className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{entry.date}</h4>
                    <div className="flex items-center">
                      <Weight className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{entry.weight}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="overflow-hidden rounded-lg relative group">
                      <img
                        src={entry.frontImage}
                        alt="Front view"
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs py-1 px-3">
                        Front View
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-lg relative group">
                      <img
                        src={entry.sideImage}
                        alt="Side view"
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs py-1 px-3">
                        Side View
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-lg relative group">
                      <img
                        src={entry.backImage}
                        alt="Back view"
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs py-1 px-3">
                        Back View
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Progress;
