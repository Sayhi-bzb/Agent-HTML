fn main() {
    #[cfg(unix)]
    if let Some(exit_code) = ahtml_desktop_lib::run_runtime_supervisor_if_requested() {
        std::process::exit(exit_code);
    }
    ahtml_desktop_lib::run()
}
