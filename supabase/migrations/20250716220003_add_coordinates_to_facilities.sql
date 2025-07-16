-- Add latitude and longitude columns to facilities table
ALTER TABLE public.facilities 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_facilities_coordinates 
ON public.facilities(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Update existing facilities with sample coordinates (Tokyo area)
-- In production, you would use a geocoding service to get real coordinates
UPDATE public.facilities SET 
  latitude = CASE 
    WHEN code = 'F001' THEN 35.6762
    WHEN code = 'F002' THEN 35.6895
    WHEN code = 'F003' THEN 35.6581
    WHEN code = 'F004' THEN 35.7023
    ELSE 35.6762 + (random() - 0.5) * 0.1
  END,
  longitude = CASE 
    WHEN code = 'F001' THEN 139.6503
    WHEN code = 'F002' THEN 139.6917
    WHEN code = 'F003' THEN 139.7414
    WHEN code = 'F004' THEN 139.5803
    ELSE 139.6503 + (random() - 0.5) * 0.1
  END
WHERE latitude IS NULL;