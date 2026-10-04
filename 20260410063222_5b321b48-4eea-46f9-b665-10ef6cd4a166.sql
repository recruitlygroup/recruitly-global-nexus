
UPDATE auth.users
SET encrypted_password = crypt('RecruitlyGroup91%', gen_salt('bf'))
WHERE email = 'admin@recruitlygroup.com';
