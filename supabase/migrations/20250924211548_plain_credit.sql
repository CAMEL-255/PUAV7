/*
  # Create sample gateways and devices

  1. New Data
    - Sample gateways for campus gates and classrooms
    - Sample devices for NFC scanning
  2. Purpose
    - Provides required gateway and device records for the NFC scanning system
    - Maps to the codes used in the application (MAIN_GATE, CLASSROOM_01, etc.)
*/

-- Insert sample gateways
INSERT INTO gateways (code, display_name, location, gateway_type, capacity) VALUES
('MAIN_GATE', 'Main Campus Gate', 'Main Entrance', 'gate', NULL),
('EAST_GATE', 'East Campus Gate', 'East Entrance', 'gate', NULL),
('WEST_GATE', 'West Campus Gate', 'West Entrance', 'gate', NULL),
('CLASSROOM_01', 'Classroom A101', 'Engineering Building - Room A101', 'classroom', 50),
('CLASSROOM_02', 'Classroom B201', 'Business Building - Room B201', 'classroom', 40),
('CLASSROOM_03', 'Classroom C301', 'Science Building - Room C301', 'classroom', 60),
('LAB_01', 'Computer Lab 1', 'Engineering Building - Lab 1', 'classroom', 30),
('LAB_02', 'Physics Lab', 'Science Building - Physics Lab', 'classroom', 25),
('AUDITORIUM', 'Main Auditorium', 'Central Building - Main Hall', 'classroom', 200),
('LIBRARY_GATE', 'Library Entrance', 'Library Building', 'gate', NULL)
ON CONFLICT (code) DO NOTHING;

-- Insert sample devices
INSERT INTO devices (device_code, device_name, owner, device_type, is_active) VALUES
('DEV001', 'Security Scanner 1', 'Security Team', 'scanner', true),
('DEV002', 'Teacher Mobile 1', 'Teaching Staff', 'mobile', true),
('DEV003', 'Security Scanner 2', 'Security Team', 'scanner', true),
('DEV004', 'Teacher Tablet 1', 'Teaching Staff', 'tablet', true),
('DEV005', 'Admin Mobile', 'Administration', 'mobile', true),
('DEV006', 'Library Scanner', 'Library Staff', 'scanner', true),
('DEV007', 'Lab Scanner 1', 'Lab Technician', 'scanner', true),
('DEV008', 'Auditorium Scanner', 'Event Staff', 'scanner', true),
('DEV009', 'Teacher Mobile 2', 'Teaching Staff', 'mobile', true),
('DEV010', 'Security Tablet', 'Security Team', 'tablet', true)
ON CONFLICT (device_code) DO NOTHING;