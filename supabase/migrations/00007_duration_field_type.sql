-- Add 'duration' to allowed field types
alter table challenge_fields drop constraint if exists challenge_fields_type_check;
alter table challenge_fields add constraint challenge_fields_type_check
  check (type in ('number', 'duration', 'text', 'date', 'boolean', 'file', 'image'));
