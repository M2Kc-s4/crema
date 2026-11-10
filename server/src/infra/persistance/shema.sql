create table if not exists users (
    id uuid primary key,
    data jsonb not null,
    createdAt timestamptz default now()
);

create table if not exists sessions (
    id uuid primary key,
    data jsonb not null,
    createdAt timestamptz default now()
);

create table if not exists products (
    id uuid primary key,
    data jsonb not null,
    createdAt timestamptz default now()
);

create table if not exists orders (
    id uuid primary key,
    data jsonb not null,
    createdAt timestamptz default now()
);

create table if not exists ingredients (
    id uuid primary key,
    data jsonb not null,
    createdAt timestamptz default now()
);