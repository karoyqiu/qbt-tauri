#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use qbittorrent_web_api::{api_impl::torrent_management::*, Api};
use serde::ser::{Serialize, Serializer};
use tauri::State;
use tokio::sync::RwLock;

struct GlobalState {
    api: RwLock<Option<qbittorrent_web_api::api_impl::Authenticated>>,
}

#[derive(Debug, thiserror::Error)]
enum Error {
    #[error(transparent)]
    Api(#[from] qbittorrent_web_api::api_impl::Error),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn qbt_login(
    url: &str,
    username: &str,
    password: &str,
    state: State<'_, GlobalState>,
) -> Result<(), Error> {
    println!("Logining {} at {}", username, url);
    let a = Api::login(url, username, password).await?;
    let mut api = state.api.write().await;
    *api = Some(a);
    println!("Logged in");
    Ok(())
}

#[tauri::command]
async fn qbt_get_torrents_info(
    filter: &str,
    state: State<'_, GlobalState>,
) -> Result<Vec<info::Response>, Error> {
    //println!("Getting torrents of {}", filter);
    let api = state.api.read().await;
    let api = api.as_ref();
    let api = api.unwrap();
    let tm = api.torrent_management();
    let builder = tm.info().filter(filter);

    Ok(builder.send().await?)
}

#[tauri::command]
async fn qbt_add(urls: &str, state: State<'_, GlobalState>) -> Result<(), Error> {
    println!("Adding urls");
    let api = state.api.read().await;
    let api = api.as_ref();
    let api = api.unwrap();
    let tm = api.torrent_management();
    tm.add(urls).root_folder("true").send().await?;
    Ok(())
}

#[tauri::command]
async fn qbt_get_files(
    hash: &str,
    state: State<'_, GlobalState>,
) -> Result<Vec<files::Response>, Error> {
    let api = state.api.read().await;
    let api = api.as_ref();
    let api = api.unwrap();
    let tm = api.torrent_management();
    Ok(tm.files(hash).send().await?)
}

#[tauri::command]
async fn qbt_set_file_priority(
    hash: &str,
    id: Vec<i32>,
    priority: file_prio::Priority,
    state: State<'_, GlobalState>,
) -> Result<String, Error> {
    let api = state.api.read().await;
    let api = api.as_ref();
    let api = api.unwrap();
    let tm = api.torrent_management();
    let id: Vec<String> = id.iter().map(|x| x.to_string()).collect();
    let id: Vec<&str> = id.iter().map(|x| &**x).collect();
    Ok(tm.file_prio(hash, &id, &priority).await?)
}

#[tauri::command]
async fn qbt_pause(hashes: Vec<String>, state: State<'_, GlobalState>) -> Result<String, Error> {
    let api = state.api.read().await;
    let api = api.as_ref();
    let api = api.unwrap();
    let tm = api.torrent_management();
    let hashes: Vec<&str> = hashes.iter().map(|x| &**x).collect();
    Ok(tm.pause(&hashes).await?)
}

#[tauri::command]
async fn qbt_resume(hashes: Vec<String>, state: State<'_, GlobalState>) -> Result<String, Error> {
    let api = state.api.read().await;
    let api = api.as_ref();
    let api = api.unwrap();
    let tm = api.torrent_management();
    let hashes: Vec<&str> = hashes.iter().map(|x| &**x).collect();
    Ok(tm.resume(&hashes).await?)
}

#[tauri::command]
async fn qbt_delete(hashes: Vec<String>, state: State<'_, GlobalState>) -> Result<String, Error> {
    let api = state.api.read().await;
    let api = api.as_ref();
    let api = api.unwrap();
    let tm = api.torrent_management();
    let hashes: Vec<&str> = hashes.iter().map(|x| &**x).collect();
    Ok(tm.delete(&hashes, true).await?)
}

fn main() {
    tauri::Builder::default()
        .manage(GlobalState {
            api: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            qbt_login,
            qbt_add,
            qbt_delete,
            qbt_pause,
            qbt_resume,
            qbt_get_torrents_info,
            qbt_get_files,
            qbt_set_file_priority,
        ])
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
