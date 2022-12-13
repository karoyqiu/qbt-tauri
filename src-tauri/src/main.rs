#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use qbittorrent_web_api::Api;
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
    println!("Login {} at {}", username, url);
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
) -> Result<Vec<qbittorrent_web_api::api_impl::torrent_management::info::Response>, Error> {
    println!("Getting torrents of {}", filter);
    let api = state.api.read().await;
    let api = api.as_ref();
    let api = api.expect("no-api");
    let tm = api.torrent_management();
    let builder = tm.info().filter(filter);

    Ok(builder.send().await?)
}

fn main() {
    tauri::Builder::default()
        .manage(GlobalState {
            api: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![qbt_login, qbt_get_torrents_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
