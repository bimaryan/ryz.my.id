-- 1. Buat bucket baru bernama 'avatars' (jika belum ada)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Izinkan publik melihat/mendownload gambar
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 3. Izinkan user yang login untuk mengupload file
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.role() = 'authenticated'
  );

-- 4. Izinkan user mengupdate avatar mereka sendiri
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid() = owner
  );

-- 5. Izinkan user menghapus avatar mereka sendiri
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    auth.uid() = owner
  );
